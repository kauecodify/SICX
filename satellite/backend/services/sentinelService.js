const axios = require('axios');
const config = require('../config/default.json');

class SentinelService {
  constructor() {
    this.apiUrl = config.sentinelHub.apiUrl;
    this.clientId = config.sentinelHub.clientId;
    this.clientSecret = config.sentinelHub.clientSecret;
    this.token = null;
    this.tokenExpires = 0;
  }

  async authenticate() {
    try {
      if (this.token && Date.now() < this.tokenExpires) {
        return this.token;
      }
      
      const response = await axios.post(`${this.apiUrl}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      });
      
      this.token = response.data.access_token;
      this.tokenExpires = Date.now() + (response.data.expires_in * 1000);
      
      return this.token;
    } catch (error) {
      console.error('Error authenticating with Sentinel Hub:', error.message);
      throw error;
    }
  }

  async fetchSatelliteData(bbox = null, timeRange = null) {
    try {
      const token = await this.authenticate();
      
      // If no bbox provided, use a default area covering main routes
      if (!bbox) {
        bbox = [-70, -40, 20, 40]; // South Atlantic area
      }
      
      if (!timeRange) {
        timeRange = {
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        };
      }
      
      const response = await axios.post(
        `${this.apiUrl}/process`,
        {
          inputs: [
            {
              bands: ['B01', 'B02', 'B03', 'B04', 'B08'],
              data: [
                {
                  type: 'sentinel-2-l2a',
                  dataFilter: {
                    timeRange,
                    bbox
                  }
                }
              ]
            }
          ],
          evalscript: `
            function setup() {
              return {
                input: ["B01", "B02", "B03", "B04", "B08", "dataMask"],
                output: { bands: 5 }
              };
            }
            
            function evaluatePixel(sample) {
              return [
                sample.B01,
                sample.B02,
                sample.B03,
                sample.B04,
                sample.B08
              ];
            }
          `
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return this.parseSatelliteResponse(response.data);
    } catch (error) {
      console.error('Error fetching satellite data:', error.message);
      return this.generateSimulatedSatelliteData();
    }
  }

  parseSatelliteResponse(apiData) {
    // Parse Sentinel Hub response
    const result = {
      timestamp: new Date().toISOString(),
      images: [],
      vesselsDetected: []
    };
    
    if (apiData && apiData.output) {
      result.images = apiData.output.map(output => ({
        url: output.url,
        timestamp: output.timestamp,
        bbox: output.bbox
      }));
    }
    
    return result;
  }

  generateSimulatedSatelliteData() {
    // Generate simulated satellite data
    return {
      timestamp: new Date().toISOString(),
      images: [
        {
          url: 'https://sentinel-hub.com/simulated/image1.jpg',
          timestamp: new Date().toISOString(),
          bbox: [-70, -40, -60, -30]
        },
        {
          url: 'https://sentinel-hub.com/simulated/image2.jpg',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          bbox: [-60, -30, -50, -20]
        }
      ],
      vesselsDetected: [
        { id: 'VSL_MSC_OSLO', latitude: -23.5505, longitude: -46.6333, confidence: 0.95 },
        { id: 'VSL_COSCO_SHIP', latitude: -34.6037, longitude: -58.3816, confidence: 0.92 }
      ]
    };
  }

  async getHistoricalImagery(bbox, timeRange) {
    try {
      const token = await this.authenticate();
      
      const response = await axios.post(
        `${this.apiUrl}/process`,
        {
          inputs: [
            {
              bands: ['B01', 'B02', 'B03', 'B04', 'B08'],
              data: [
                {
                  type: 'sentinel-2-l2a',
                  dataFilter: {
                    timeRange,
                    bbox,
                    maxCloudCoverage: 20
                  }
                }
              ]
            }
          ],
          evalscript: `
            function setup() {
              return {
                input: ["B01", "B02", "B03", "B04", "B08", "SCL"],
                output: { bands: 5, sampleType: "INT16" }
              };
            }
            
            function evaluatePixel(sample) {
              if (sample.SCL === 0) { // Clear pixels
                return [
                  sample.B01 * 10000,
                  sample.B02 * 10000,
                  sample.B03 * 10000,
                  sample.B04 * 10000,
                  sample.B08 * 10000
                ];
              }
              return [0, 0, 0, 0, 0];
            }
          `
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return this.parseSatelliteResponse(response.data);
    } catch (error) {
      console.error('Error fetching historical imagery:', error.message);
      return null;
    }
  }

  async detectVesselsInArea(bbox, timeRange) {
    try {
      const token = await this.authenticate();
      
      // This would use a vessel detection algorithm on satellite imagery
      // For now, we'll simulate it
      
      const satelliteData = await this.fetchSatelliteData(bbox, timeRange);
      
      // Simulate vessel detection
      const detectedVessels = [];
      
      // Check if our sample vessels are in the bbox
      const checkInBbox = (lat, lon, bbox) => {
        return lat >= bbox[1] && lat <= bbox[3] && lon >= bbox[0] && lon <= bbox[2];
      };
      
      if (checkInBbox(-23.5505, -46.6333, bbox)) {
        detectedVessels.push({
          id: 'VSL_MSC_OSLO',
          latitude: -23.5505,
          longitude: -46.6333,
          confidence: 0.95,
          detectionTime: new Date().toISOString()
        });
      }
      
      if (checkInBbox(-34.6037, -58.3816, bbox)) {
        detectedVessels.push({
          id: 'VSL_COSCO_SHIP',
          latitude: -34.6037,
          longitude: -58.3816,
          confidence: 0.92,
          detectionTime: new Date().toISOString()
        });
      }
      
      return {
        ...satelliteData,
        vesselsDetected: detectedVessels
      };
    } catch (error) {
      console.error('Error detecting vessels:', error.message);
      return null;
    }
  }

  async getWeatherConditions(bbox) {
    // In a real implementation, this would fetch weather data
    // For now, return simulated data
    return {
      windSpeed: 15,
      windDirection: 120,
      waveHeight: 2.5,
      visibility: 10,
      temperature: 22,
      conditions: 'FAIR'
    };
  }
}

module.exports = new SentinelService();

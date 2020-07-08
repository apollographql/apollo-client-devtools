const { RESTDataSource } = require('apollo-datasource-rest');

function hexCode() {
  return Math.floor(Math.random()*16777215).toString(16);
}

class ColorAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://www.thecolorapi.com/';
  }

  getRandomColor() {
    return this.identifyColor({ hex: hexCode() });
  }

  getRandomScheme() {
    return this.getColorScheme({ hex: hexCode() });
  } 

  async identifyColor({ hex }) {
    const data = await this.get('/id', {
      hex,
    });

    return {
      hex: data.hex.value,
      rgb: data.rgb.value,
      name: data.name.value,
      contrast: data.contrast.value,
    }
  }

  async getColorScheme(params) {
    // https://github.com/apollographql/apollo-server/issues/3483
    for (const property in params) {
      if (!params[property]) {
        delete params[property];
      }
    }

    const data = await this.get('/scheme', params);

    return {
      mode: data.mode,
      count: data.count,
      colors: data.colors.map(color => ({
        hex: color.hex.value,
        rgb: color.rgb.value,
        name: color.name.value,
        contrast: color.contrast.value,
      })),
    };
  }
}

module.exports = ColorAPI;
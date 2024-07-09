export default {
  process(source) {
    return { code: `module.exports = ${JSON.stringify(source)}` };
  },
};

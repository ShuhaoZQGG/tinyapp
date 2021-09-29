const generateRandomString = function() {
  return (Math.random()*1e9).toString(36).slice(0,6);
}

module.exports = {
  generateRandomString
}
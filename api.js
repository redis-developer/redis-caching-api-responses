import constants from './constants.js'
import Redis from 'ioredis'
import axios from 'axios'

const redis = new Redis(constants.redis)

const keyCheck = () =>  {
	if (!process.env.WEATHER_API_KEY) {
	  console.error(`No Weather API key detected as an ENVIRONMENT VARIABLE.
	  Head to https://openweathermap.org/appid to get a free API key.
	  Then store the key in an environment variable from the command line:
	  $ export WEATHER_API_KEY=<your api key>`)
	  quit()
	}
}

const quit = () => {
	redis.quit()
	process.exit()
}

const cityEndpoint = (city) => `${constants.endpoint(city)}${constants.key}`

/* Returns a JSON object of the current weather conditions for a given city */
const getWeather = async (city) => {

  /* Check if WEATHER_API_KEY exists in Environment Variables */
  keyCheck()

  /* Check Redis for cached entry first */
	let cacheEntry = await redis.get(`weather:${city}`)

    /* If Redis returns a cache hit, */
  if (cacheEntry) {
	  cacheEntry = JSON.parse(cacheEntry)
    /* return the entry */
    return {...cacheEntry, 'source' : 'cache'}
	}

 
  /* If Redis returns a cache miss, fetch and return data from the API */
	const apiResponse = await axios.get(cityEndpoint(city))
	
  /* Add the entry to Redis for next time and set an expiry of one hour */
  redis.set(`weather:${city}`, JSON.stringify(apiResponse.data), 'EX', 3600)

  /* Return the database entry */
	return {...apiResponse.data, 'source' : 'API' }
}

const city = 'Oakland'
const t0 = new Date().getTime()
const weather = await getWeather(city)
const t1 = new Date().getTime()
weather.responseTime = `${t1-t0}ms`
console.log(weather)
quit()
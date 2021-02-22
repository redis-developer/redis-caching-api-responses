export default {
    'endpoint': (city) => `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=`,
    'key' : process.env.WEATHER_API_KEY,
    'redis' : {
        'port': process.env.REDIS_PORT || 6379,
        'host': process.env.REDIS_HOST || '127.0.0.1'
    }
}
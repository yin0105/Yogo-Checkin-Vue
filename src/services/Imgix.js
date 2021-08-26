import qs from 'qs'

const buildURL = (filename, options) => {
  if (!filename){
    return ''
  }
  return 'https://' + process.env.VUE_APP_IMAGE_SERVER_IMGIX + '/' + filename + '?' + qs.stringify(options)
}

export default {
  methods: {
    Imgix: buildURL
  }
}



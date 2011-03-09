require 'rubygems'
require 'json'
require 'net/http'

# TODO: initialize a session variable for storing 
# JSON data
# query the JSON for specific data

# Returns: a smaller JSON with the specified data

def getData(url)
  # call URL and get the data
  resp=Net::HTTP.get_response(URI.parse(url))
  
  data=resp.body
  
  # convert into Ruby hash array
  r=JSON.parse(data)
  return r
end

def init(url)
  # parse up the url
  qstring=URI.parse(url)
  # find the query string
  # and put in correct function call
  case qstring.query
    when /images/
      # asking for all images
      outputImageData()
  end
  
end

def outputImageData()
  # take all of the items from 
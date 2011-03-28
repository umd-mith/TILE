# Library for importing data from any XML file into 
# JSON code for TILE

require 'cgi'
require 'rubygems'

print "HTTP/1.0 200 OK\r\n"
print "Content-type: text/html\r\n\r\n"

# get the query string and parse its pieces
print cgi['file']

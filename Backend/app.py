import os, logging, time
from flask import Flask, request
import pypyodbc as pyodbc
import  serverAnalysisAzure	#importing Yoseph's bike analysis code

DB_HOST = 'tcp:digital-gym-sql-server.database.windows.net'
DB_NAME = 'Digital-Gym-DB'
DB_USER = 'Rice.Sensor'
DB_PASSWORD = 'Ashu1234!'
CONNECTION_STRING = 'Driver={SQL Server};Server=' + DB_HOST + ';Database=' + DB_NAME + ';UID=' + DB_USER + ';PWD=' + DB_PASSWORD + ';'

#Sets up basic cpnfigurations
app = Flask(__name__)
wsgi_app = app.wsgi_app


#URL declarations
@app.route('/')
def Welcome():
	#logging.warning('testing url index')
	
	return "<h1>This is the homepage</h1>"

@app.route('/bike-data/<int:idNum>', methods=['GET', 'POST'])
def BikeData(idNum):
	if request.method == 'POST':	#handles POST request (for uploading documents)
		#logging.warning('entered post request code')
		#check to see if the post request has the json part
		if request.get_json() == None:
			#logging.warning('No json part')
			return "Did not receive a json"
		
		json = request.get_json(force=True)
		
		#if the json is empty
		if len(json) == 0:
			#logging.warning('json was empty')
			return "got an empty json"

		#PROCESS DATA
		rpm = 0
		rpm = float(serverAnalysisAzure.compute(dict(json)))
		#print(rpm)

		#store it in DB
		connection = pyodbc.connect(CONNECTION_STRING)	#connects to the database
		cursor = connection.cursor()					#creates the cursor object, used to run sql commands

		#logging.warning('just before the for loop')
		for timestamp in json.keys():
			try:
				cursor.execute("INSERT INTO id" + str(idNum) + "(id, stamp, x, y, z, xG, yG, zG, xM, yM, zM, rpm) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", 
				   tuple([str(timestamp)] + [int(timestamp)] + list(json[timestamp]) + [rpm]))
				cursor.commit()
			except:
				#print(list(json[timestamp]))
				pass

		connection.close()
		return "success"	
		
	return 'Send the bike data here'
		
'''
		#debugging and running locally
port = os.getenv('PORT', '5000')
if __name__ == "__main__":
	app.run(debug=True, host='0.0.0.0', port=int(port))
	#app.run(debug=True)	#to run locally
	'''

if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(HOST, PORT)
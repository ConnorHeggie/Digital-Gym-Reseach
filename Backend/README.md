# Digital-Gym-Reseach
Working repository for the backend team.

The goal of this team is to handle the cloud storing and processing of the data that gets sent from the sensors and subsequently to the mobile app.

Files:
app.py - The main Flask app that handles urls routing and processing.
bikeAnalysisOld.py - Original code for extracting RPM, does not work in cloud due to SciPy issue.
serverAnalysisAzure.py - New code to extract RPM from bike data, works in cloud but does not produce correct numbers.
requirements.txt - Requirements for the virtual environment that app.py runs in.

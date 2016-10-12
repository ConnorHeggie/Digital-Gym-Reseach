#import pandas as pd
import numpy as np
#from scipy import signal
#import matplotlib.pyplot as plt

# times = pd.date_range('2016-07-19', periods=200, freq='.025sec')


# sample = {}


# filename = "SAMPLE.json"
# file = pd.read_json("{}".format(filename))
# file = pd.Series(d, name = '')

"""
Citation: "Analysis of Time and Frequency Domain Features
of Accelerometer Measurements" - Waltenegus Dargie, Tech U of Dresden

Time Domain Features: Mean, Zero Crossing Rate, Maxima/Minima, Autocorrelation,
Cross Correlation, Linear Correlation Coefficient, Standard Deviation.

Frequency Domain Features: Mean, Correlation, Spectral roll-off, Spectral centroid,
Spectral flux.


"""





def zeroCrossRate(vec):
	"""
	Find the number of times the signal crosses the zero point
	Cases:
		Crosses from positive to negative
		Crosses from zero to value opposite that of the value before it.
	"""

	count = 0
	for x in range(1,len(vec)):
		prod = vec[x] * vec[x-1]
		if vec[x] == 0 and vec[x-1] > 0 and \
						   vec[x+1] > 0:
			count += 1
		elif prod < 0:
			count += 1
	return count / (len(vec)-1)

def autocorrelation(vec, mean):
	"""
	Calculating the autocorrelation using the Pearson product-movement correlation coefficient.
	Normalizes the autocorrelation.

	:param vec, mean:
	:return autocorr:
	"""

	if type(vec) != np.ndarray: vec = np.asarray(vec)
	n = len(vec)

	autocorr = np.correlate(vec,vec, mode='same')[n // 2:]
	lengths = range(n, n // 2, -1)
	autocorr /= lengths
	autocorr /= autocorr[0]
	return autocorr

def frequencyDomain(data):
	Fs = 40
	L = len(data)
	np2 = nextpow2(L)
	fftlength = np2 
	ctr = int((fftlength/2))
	faxis = np.multiply(Fs/2,np.linspace(0,1,ctr))
	fdata = np.fft.fft(data,fftlength)
	mag = abs(fdata[0:ctr])
	#print(fdata[0:ctr])
	#print(len(fdata)//2,ctr)
	return np.asarray(mag)

def nextpow2(n):
		"""
		n = integer.
		Bike_1.csv = 38558
		Return: Next largest value that is equal to 2^x
		"""

		n -= 1
		n |= n >> 1
		n |= n >> 2   
		n |= n >> 4
		n |= n >> 8
		n |= n >> 16  
		n += 1  
		return n

def findPeaks(vec, Fs=None):
	"""
	
	"""
	if type(vec) != np.ndarray: vec = np.asarray(vec)
	L = len(vec)
	np2 = nextpow2(L)
	fftlength = np2 
	ctr = int((fftlength/2))
	Fs = 40
	# 
	max_idx = vec[fftlength/100:(3*fftlength/8)].argmax()
	if Fs == None: pass
	else: max_idx = max_idx / ctr * (Fs/2)

	return max_idx

def readData(dict1):
	newd = dict()
	ts = []
	ts1 = dict1.keys()
	for key, val in dict1.items():
		newkey = int(key)
		ts.append(int(key))
		#print("DICTIONARY VALUES")
		#print("X: {}".format(dict1[key]))
		newd[newkey] = val
		#print(newd[newkey]==dict1[key])
	np.sort(ts) # Hopefully this sorts the calendar dates from least to greatest.
	#print("Length of TS: {}".format(len(ts)))
	return (ts, newd)


def compute(accdata):
	(ts, newdata) = readData(accdata)
	ux_x = []
	ux_y = []
	ux_z = []
	ux = [ux_x, ux_y, ux_z]
	for time in ts:
		
		#try:
		#	print("Val1: {}".format(newdata[time][2]))
		#except:
		#	print("Timeincorrect: {}".format(time))
		#	print("Valueincorrect: {}".format(newdata[time]))
		#	return -1

		#print("Time: {}, TimeData:{}".format(type(time), newdata[time]))
		try:
			ux_z.append(newdata[time][2])
			ux_x.append(newdata[time][0])
			ux_y.append(newdata[time][1])
		except:
			pass
	#print("ux ARRAY: {}".format(ux_x))
	pow = [np.linalg.norm(np.asarray(ux_x)), np.linalg.norm(np.asarray(ux_y)), np.linalg.norm(np.asarray(ux_z))]
	tsig = np.asarray(ux[pow.index(max(pow))])  # set data as the axis with the largest power.

	
	#print(tsig)
	tmean = tsig.mean()
	zcrate = zeroCrossRate(tsig)
	mcrate = zeroCrossRate(tsig-tmean)
	minima = tsig.min()
	maxima = tsig.max()
	variance = tsig.var()
	autocorr = autocorrelation(tsig,tmean)
	std = np.std(tsig)

	fsig = frequencyDomain(tsig)
	fmean = fsig.mean()
	fcorr = autocorrelation(fsig,fmean)
	Fs = 40
	rpm = findPeaks(fsig, Fs)
	#print("RPM {}".format(rpm))

	# Need to make sure these creation of arrays are valid since it's a mix of
	# numbers and arrays...
	# timevec = np.array([tmean,zcrate,mcrate,minima,maxima,variance,autocorr,std])
	# fvec = np.array([fsig,fmean,fcorr,fpeaks,frelmax,rpm])


	return float(rpm)
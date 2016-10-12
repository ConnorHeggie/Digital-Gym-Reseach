filename = 'Bike_2.csv';
nineAxis = xlsread(filename);

Accel_X = nineAxis(:,4);
Accel_Y = nineAxis(:,5);
Accel_Z = nineAxis(:,6);


Accel = [Accel_X, Accel_Y, Accel_Z];

disp(~isnan(Accel(:,1)))

for i = 1:3
  NewAccel{i}=Accel(~isnan(Accel(:,i)), i);
end

Accel = [NewAccel{1}, NewAccel{2}, NewAccel{3}];

norms = zeros(1,3);
norms(1,1) = norm(Accel(:,1));
norms(1,2) = norm(Accel(:,2));
norms(1,3) = norm(Accel(:,3));

[M,I] = max(norms);
maxAxis = Accel(:, I);

%takes fft of whole thing
%fftlength = 2^(nextpow2(length(maxAxis))-1);
% freqs = fft(maxAxis, fftlength);
% plot(abs(freqs))

rpms = zeros(length(maxAxis)-512,1);

for i = 513:10:length(maxAxis)
    window = maxAxis(i-512:i, 1);
    freqs = fft(window, 512);
    curRPM = max(abs(freqs));
    rpms(i, 1) = curRPM;
end

plot(rpms);
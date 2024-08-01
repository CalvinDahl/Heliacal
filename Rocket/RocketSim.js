clear all, clc, close all;
pkg load io
pkg load statistics
############################################
        %% Calvin Dahl 3/10/24 %%
############################################

%%%%%%%%%% INSTRUCTIONS FOR OPERATION %%%%%%%%%%
 % - (Optional) Check Thrust Curve Data And 
 %    Change Coordinates Appropriately In Code
 %    Format Is Time (Column 1) Thrust (Column 2)
 %    NOTE -> Include Time 0 Thrust 0
 % - (Optional) Include Stability File:
 %    Alpha | Cl | Cd | Fbody | Aero Center
 %    NOTE -> Comment out unused sections of code
 % - Change Rocket Specifications, Initial Conditions
 %    And Loop Parameters As Needed
%%%%%%%%%% INSTRUCTIONS FOR OPERATION %%%%%%%%%%

%%%%%%%%%% ASSUMPTIONS %%%%%%%%%%
 % - Non-Dimensional Coefficients  (Cm, Cd, Cl) at AoA constant 
 %    with respect to velocity / changing Reynolds Number
 % - Force acting on fins applied at quarter chord
 % - Center of Pressure of nose applied at 33% length from base of nose
%%%%%%%%%% ASSUMPTIONS %%%%%%%%%%
  
%Rocket Specifications
  let Cd = 0.4001; % (N/A) Coefficient of Drag Total (At 0 Sideslip)
  let m = 4.153; % (kg) Initial Rocket Mass
  let Mp = 0.3125; % (kg) Propellant Mass
  let Tb = 2.94; % (s) Motor Burn Time
  let H_Rocket = 1.4033; % (m) Total Rocket Height
  let H_Nose = 0.1778; % (m) Rocket Nose Height
  let H_Motor = 0.367; % (m) Motor Height
  let d = 102; % (mm) Diameter of Rocket
  let A_Front = pi*(d/2000)^2; % (m^2) Frontal Rocket Area
  let I = 636; % (Ns) Rocket Total Impulse
  
  %Average Thrust
  let Thrust = I/Tb; % (N) Rocket Thrust
  %Thrust Curve Data Points Input
  let motor = xlsread('Cesaroni_636I216-14A.xlsx','Cesaroni_636I216-14A','A6:B22');
  
  %Parachute Specifications
  let CdParachute = 1.5; %Parachute Drag Coefficient
  let dParachute = 1219.2; % (mm) Parachute Diameter
  
  %Stability Specifications
  let Iy = 0.7395447; % (kg*m^2) Inital Moment Of Inertia measured in longitudinal direction
  let CoM = 0.78673955; % (m) Initial Center of Mass Measured From Base of Rocket (Do not Include Fin Distance)
  let RailHeight = 2.4384 + (H_Rocket - CoM); % (m) Rail Height + Location From Nose to CoM(initial)
  let Stability = xlsread('DragAndLiftData.xlsx','Sheet1','A2:E6'); % Data For Stability
  let Order = 4; %Spline Order of CurveFit function (1 -> Linear fit, 2 -> Quadratic fit, etc...)
  let [Coeffs] = StabilityFunction(Stability,Order+1); % Function to curvefit Data Points
  %Fin Specifications
  let Cr = 0.13462; % (m) root chord length
  let Ct = 0.117602; % (m) tip chord length
  let b = 0.047244; % (m) fin span
  let Theta = 35.54; % (deg) Sweep Angle at Leading Edge
  %Aerodynamic Center Approximations
  let Sw = 0.5*(Ct + Cr)*b; % (m^2) fin area
  let FinY_AC = (b/3)*(Cr+2*Ct)/(Cr+Ct); % (m) y Aero Center
  let C_crit = Cr - (FinY_AC/b)*(Cr-Ct); % (m) Chord at Aero Center
  let FinX_AC = Cr - 0.25*C_crit - FinY_AC*tan(Theta*pi/180); % (m) x Aero Center measured from base of rocket
  let Nose_AC = H_Rocket - H_Nose*0.66666; % (m) Aero Center of Nose measured from base of rocket
  
%Initial Conditions
  let rho = 1.225; % (kg/m^3) Density of Air
  let g = 9.81; % (m/s^2) Earth Gravity
  let Wspeed(1) = 3.048; % (m/s) Constant Wind Speed (in x-coord only)
  let Sigma = 0; % Standard Deviation to Wind Speed'
  let t_Wind = 0.1; % (s) time to change wind randomness
  
%Loop Parameters and Initialization
  let h = 0.1; % (m) Rocket Height
  let v = 0.1; % (m/s) Rocket Velocity
  let acc = 0; % (m/s^2) Rocket Acceleration
  let x = 0; % (m) Rocket Initital x Coordinate
  let OmegaDot = 0; % (rad/s^2) Rocket Angular Acceleration
  let Omega = 0; % (rad/s) Rocket Angular Rotation Rate
  let Gamma = 0*pi/180; % (rad) Rocket Flight Path Angle
  let Alpha = 0; % (rad) Wind SideSlip Angle 
  let Cm = 0; % Initial Moment Coefficient
  let dt = 0.001; % (s) Time Step
  let tmax = 300; % (s) Max Time till loop ends
  let TimeToApogee = tmax; % (s) Time once Apogee Achieved
  let i = 1; % Counter to store Height & Velocity Values
  let k = 0; % Counter to store Gamma Values

%MAIN() LOOP FUNCTION
for t=dt:dt:tmax
  
	if(v < 0 && TimeToApogee > t) % Once max height achieved deploy parachute
    TimeToApogee = t;
		A_Front = 3.14159*(dParachute/2000)^2; %Reference Area change to Parachute Reference Area
    Cd = -CdParachute; %Change Drag Coefficient And Direction
  endif
  
  if(h < 0) % Once touchdown occurs break loop
    tmax = t;
    break
  endif
  
  if(t < Tb) %Thrust = 0 once burn time ends
    m -= (Mp*dt/Tb); %Update Rocket Mass
    CoM += (Mp*dt/(Tb*m))*(CoM - H_Motor/2); %Update Center of Mass
    Iy -= (dt/Tb)*Mp*(CoM - (H_Motor/2))^2; %Update Longitudinal Moment of Inertia
  endif
  
  %Thrust Calculation
  if(t < motor(size(motor,1),1))
    for j=1:1:(size(motor,1)-1)
      if(t < motor(j+1,1)) %Linear Interpolation Between Data Points
        Thrust = motor(j,2) + ((t - motor(j,1))/(motor(j+1,1) - motor(j,1)))*(motor(j+1,2) - motor(j,2));
        break
      endif
    endfor
  endif
  
  
  %Rocket Stability Loop
  if(v > 0 && h > RailHeight) %Vertical Ascent Stage
    
    %Rocket Flight Path Angle Calculations
    Alpha = atan(Wspeed(i-1)/v) - Gamma; %Angle of Attack (SideSlip Angle Calculation - Flight Path Angle)
    
    %Rocket Coefficients Found Through CFD / Wind Tunnel Testing
      %evalFit evaluates the curvefit
    Cl_Fin = evalFit(Coeffs{2},abs(Alpha)*180/pi);
    Cd = evalFit(Coeffs{3},abs(Alpha)*180/pi);
    CN_Nose = evalFit(Coeffs{4},abs(Alpha)*180/pi);
    Cm_Body = evalFit(Coeffs{5},abs(Alpha)*180/pi);
    if(Alpha*180/pi > 15) %Cutoff Values After Alpha > 15 (IF STALLING VALUES NOT MEASURED)
      Cl_Fin = evalFit(Coeffs{2},abs(15));
      Cd = evalFit(Coeffs{3},abs(15));
      CN_Nose = evalFit(Coeffs{4},abs(15));
      Cm_Body = evalFit(Coeffs{5},abs(15));
    endif
    
    %Moment Generated By Forces (From Rocket Coefficients) (Nm)
    Moment = 0.5*rho*(v^2)*(Cl_Fin*(2*Sw)*(CoM-FinX_AC) - CN_Nose*A_Front*(CoM-Nose_AC) + Cm_Body*(d/2000)*A_Front);
    
    %Moment Coefficients
    Cm_0 = Cm; %Store Previous Moment Coefficient
    Cm = (Moment)/(0.5*rho*(v^2)*(d/2000)*A_Front); %Moment Coefficient Calculation
    Cmd = Omega*(d/2000)*(2.2*Cl_Fin*(2*Sw/A_Front)*((CoM-FinX_AC)/C_crit)^2)/(2*v); %Damping Moment Coefficient
    
    if Alpha > 0 %If Alpha > 0 Correcting Positively
      OmegaDot += ((Cm-Cmd)*0.5*rho*(v^2)*(d/2000)*A_Front/Iy); %Rotational Acceleration Calculation (rad/s^2)
    else %If Alpha < 0 Correcting Negatively
      Cmd = -Cmd;
      OmegaDot -= ((Cm-Cmd)*0.5*rho*(v^2)*(d/2000)*A_Front/Iy); %Rotational Acceleration Calculation (rad/s^2)
    endif
    Omega = OmegaDot*dt; %Angular Rate Calculation (rad/s)
    Gamma += Omega*dt; %Update Flight Path Angle (rad)
    
    %STORE LONGITUDINAL STABILITY COEFFICIENTS AND VALUES%
    CMD(i-k) = Cmd; %Moment Damping Coefficient
    CM(i-k) = (Cm); %Moment Coefficient
    CoeffLift(i - k) = Cl_Fin; %Lift Coefficient
    CoeffDrag(i - k) = Cd; %Drag Coefficient
    Alp(i - k) = Alpha*180/pi; %SideSlip Angle
    G(i - k) = Gamma*180/pi; %Flight Path Angle
    OMEGA(i - k) = Omega; %Flight Path Angle
    %STORE LONGITUDINAL STABILITY COEFFICIENTS AND VALUES%
  elseif(v > 0 && h < RailHeight) %Time rocket is on rail
    k++; %Parameter to store stability values
    T_Rail = t; 
  else
    Gamma = abs(atan(Wspeed(i-1)/v));
  endif
  
  if(rem(t,t_Wind) == 0)
    Wspeed(i) = normrnd(Wspeed(1),Sigma); % Wind Randomness Calculation
  elseif(i>2)
    Wspeed(i) = Wspeed(i-1);
  else
    Wspeed(i) = Wspeed(1);
  endif
  
	Drag = 0.5*rho*(v^2)*Cd*A_Front; % Drag Calculation
	v += (Thrust - Drag - g*m)*dt/m; % Velocity Calculation
  acc = (Thrust - Drag - g*m)/m; % Acceleration Calculation
	h = h + (v*cos(Gamma)*dt); % Height Calculation
  x = x - (v*sin(Gamma)*dt); % Rocket Drift Calculation
  
  %CONVERSION FROM METRIC TO IMPERIAL UNITS%
  H(i) = h*3.2808399;
  V(i) = v*3.2808399;
  X(i) = x*3.2808399;
  M(i) = m*2.20462262;
  Acc(i) = acc*3.2808399;
  Th(i) = Thrust*0.224808943;
  %CONVERSION FROM METRIC TO IMPERIAL UNITS%
  i++;
endfor

############################################
        %% Data Plots And Values %%
############################################

%Print Values
fprintf(' ######### Rocket Data #########')
fprintf('\n Rocket Max Altitude = %g ft', max(H))
fprintf('\n Rocket Max Velocity = %g ft/s', max(V))
fprintf('\n Rocket Max Acceleration = %g ft/s^2', max(Acc))
fprintf('\n Rocket Empty Mass = %g lbs', min(M))
fprintf('\n Rocket Time to Apogee = %g s', TimeToApogee)
fprintf('\n Rocket Average Drag Coefficient = %g', mean(CoeffDrag))
fprintf('\n\n ######### Rocket Recovery Data #########')
fprintf('\n Rocket Descent Rate = %g ft/s', min(V))
fprintf('\n Rocket Drift = %g ft', max(X))
fprintf('\n Wind Speed = %g ft/s = %g mph', Wspeed(1)*3.2808399, Wspeed(1)*2.23693629)
fprintf('\n\n ######### Rail Conditions #########')
fprintf('\n SideSlip Angle Off Rail = %g deg', Alp(1))
fprintf('\n Rocket Velocity Off Rail = %g ft/s', V(k))

%Subplots For Velocity, Height, Acceleration
%%{
figure(1)
t=0:dt:tmax - (2*dt);
subplot(3,1,1)
plot(t,H,"linewidth", 1.5) 
title('Rocket Altitude Vs Time','fontsize',14)
xlabel('time (s)','fontsize',12)
ylabel('Altitude (ft)','fontsize',12)
grid on

subplot(3,1,2)
plot(t,V,"linewidth", 1.5) 
title('Rocket Velocity Vs Time','fontsize',14)
xlabel('time (s)','fontsize',12)
ylabel('Velocity (ft/s)','fontsize',12)
grid on

subplot(3,1,3)
plot(t,Acc,"linewidth", 1.5) 
title('Rocket Acceleration Vs Time','fontsize',14)
xlabel('time (s)','fontsize',12)
ylabel('Acceleration (ft/s^2)','fontsize',12)
grid on

%Thrust Curve
figure(2)
plot(t,Th, 'r') 
title('Rocket Thrust Vs Time','fontsize',14)
xlabel('time (s)','fontsize',12)
ylabel('Thrust (lbf)','fontsize',12)
xlim([-Inf, Tb])
grid on

%Rocket X and Y Position Across Time
figure(3)
plot(X,H,'g',"linewidth", 2) 
title('Rocket Position Tracking','fontsize',14)
xlabel('Drift (ft)','fontsize',12)
ylabel('Altitude (ft)','fontsize',12)
ylim([0, Inf])
grid on

%Flight Path Angle & SideSlip Angle
t=0:dt:TimeToApogee-((2+k)*dt);
figure(4)
plot(t,Alp, 'r')
hold on
plot(t,G, 'g')
title('Rocket Flight Path Angle & SideSlip Angle','fontsize',16)
xlabel('time (s)','fontsize',14)
ylabel('Flight Path Angle (deg)','fontsize',14)
line("xdata",[(Tb - ((k+2)*dt)),(Tb - ((k+2)*dt))], "ydata",[-10,90],"linewidth",1,"linestyle","--")
line("xdata",[(TimeToApogee - ((k+2)*dt)),(TimeToApogee - ((k+2)*dt))], "ydata",[-10,90],"linewidth", 1)
h = legend('SideSlip Angle','Flight Path Angle','t burnout (s)','t apogee (s)');
set(h,"fontsize",14)
grid on

%Drag & Lift Coefficients
figure(5)
plot(t,CoeffLift)
hold on
plot(t,CoeffDrag)
title('Lift And Drag Coefficients During Flight','fontsize',16)
xlabel('time (s)','fontsize',14)
ylabel('CL & CD','fontsize',14)
h = legend('CL(Fins)','CD(System)');
set(h,"fontsize",16)
grid on
%}

%View CurveFit
%{
for(i=2:1:length(Stability(:,1)))
  figure(i-1)
  y_LS = evalFit(Coeffs{i}, Stability(:,1));
  plot(Stability(:,1), y_LS);
  hold on 
  scatter(Stability(:,1),Stability(:,i));
  xlabel('Angle of Attack (Degrees)','fontsize',18)
  Name = {'CL Fin','CD Sys','CN Nose','CM Body'};
  ylabel(Name{i-1},'fontsize',18)
  title('CurveFitting Graphs','fontsize',20)
  h = legend('CurveFit','CFD');
  set(h,"fontsize",14)
  grid on

  % sum of squares of errors
  SSE = sum((Stability(:,i)-y_LS).^2);
  % standard error
  std_error = sqrt(SSE/(length(Stability(:,1)-(Order+1))));
  y_mean = mean(Stability(:,i));
  So = sum((Stability(:,i)-y_mean).^2);
  % R squared
  r2 = (So-SSE)/So;

  printf('\n\n ######### Curve Fit Values (%s) #########\n',Name{i-1})
  printf(' Sum of Squares of Errors (SSE) = %12.5e \n', SSE)
  printf(' Mean = %12.5e \n', y_mean)
  printf(' R squared = %.6f \n', r2)
  printf(' Standard error = %12.5e', std_error)
endfor
%}
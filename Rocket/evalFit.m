function[y] = evalFit(a,x)
  
  ##%exaluate the LS fit at x values
  % creating y functions
  i = 1:length(a);
  y = sum(a.*x.^(i-1),2);
  
  ##y = a_2*x^2 + a_1*x + a_0 ...
  
  %easier but slower way (BROKEN)
  %{
  num_coeffs = length(a);
  num_data_points = length(x);
  y = zeros(num_data_points,1);
  for i = 1:num_data_points
    for j = 1:num_coeffs
      y(i) = a(j)*x(i)^(j-1);
    endfor
  endfor
  %}
endfunction
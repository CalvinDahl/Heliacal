function[Y] = StabilityFunction(Stability,m)
  for(i=1:5)
    x = Stability(:,1);
    y = Stability(:,i);
    [coeffs] = LeastSquares(x,y,m);
    Y{i} = [coeffs];
  endfor
endfunction
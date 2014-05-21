

% Let a=18, b=7.

% We assume each day the usable time is from 6am to 11pm. For notation convenience, 
% we set 1 hour as a unit and number the total usable units each day
% as 1, 2,\cdots, 18. We refer to time slot (i,j) as the ith unit on the
% jth day, where 1<=i<=a and 1<=j<=b.

% Inputs are: 
% (1) A binary matrix M with dimension of a by b, which 
% indicates the time unit (i,j) is available iff M(i,j)=1;
% (2) the number of tasks, denoted
% by n and a vector of n by 1, denoted by L, where L(j) is the number of
% time units needed to complete task j. 


% (3) We modify the input slightly. D is vector of n by 1, where D(i)
% stores the index of the deadline of the ith task in M. Note that the value
% D(i) ranges from 1 to a*b and we allow two different tasks share a same
% deadline.
% 
% (4) Tol is the tolenrance set by the user, which denotes the maximum number
% of time units the user would like to work continuously each day. By
% default, Tol=3. 
%
% (5) Order refers to the priority list of tasks in which the user expects 
% to finise before deadline. For example, Order=(3,1,5,4,2), which means
% the user hopes, under the precondition that all tasks are completed 
% before deadline, task 3 can be finished as early as possible. 

% (6) To incorporate the priority, we need to introduce more bianry
% varibles. For each task 1<=j<=n, we introduce p_j binary varibles where
% p_j   

% (7) Inputs Tol and order are optional.



function S=schedule(M, D, L, Tol, order)
% load data2
% order=[1,2,3,4,5];
 if isempty(Tol)
   Tol=3; 
 end


    
    
Tol=Tol+1;
[a,b]=size(M);
m1=reshape(M, a*b,1);
intime=find(m1);
natime=sum(m1); 

h1=sum(M); 
H1=[];

for j=1:b
    h2=M(:,j);
    h3=find(h2);
    for i=1:length(h3)
       if sum(M(h3(i):min(h3(i)+Tol-1,a),j))==Tol
        H1=[H1;sum(h1(1:j-1))+i];   
           
       end        
    end
           
end



% h1 is a row vector where h1(i) records the number of available time units in day i,
% 1 <= i <=7.
% H1 is a column vector recording the index of available time units in the
% total number of available time units of M, 
% starting from which there are at least Tol continuous available time units
% in M.





if natime<sum(L)
    S=0;
    return
    
end

ntask=length(L);

% a is the parameter which denotes the number of usable time units 
% consider during each day. By default we have a=18.
% natime is the total number of available time units in the input M.
% nv=natime*ntask is the total number of binary variables introduced.


 d2=zeros(ntask,1); 
 % d2(j) stores how many available time units in M before the deadline j
 
 for i=1:ntask
     d2(i)=sum(m1(1:D(i)-1));
     
 end
 
 d3=d2-L;
 if sum(d3>=0)<ntask
    S=0;
    return      
 end
 
 
 nextra=sum(d3);
 nv=natime*ntask+nextra;
 
 % d3(j) stores the difference of the total number of availale time units
 % before deadline j to the workload of task j. That is also the number of
 % extra binary variales needed to introduce to consider the priority. 
 

 % \sum_{i=L(j)+k}^{d2(j)} Z_{i,j} \le L(j)P_{j,k} for each 1 \le j \le n 
 % and 1\le k \le d2(j)-L(j)=d3(j).
 
 % the index of completion date of task j in the available time should be 
 % F(j)=sum_{k=1}^{d3(j)} P_{j,k}+L(j) 
 
  
 A1=[];
 a1=ones(1,ntask);
 for i=1:natime
    A1=blkdiag(a1,A1); 
 end
  A1=[A1, zeros(natime,nextra)];
 
  ub1=ones(natime,1);
  
  A2=zeros(ntask,natime*ntask);
  
  for j=1:ntask
     for i=1:d2(j)
      A2(j,j+(i-1)*ntask)=1;   
         
     end
  end
  
 A2=[A2, zeros(ntask,nextra)];
  
   
 h4=length(H1);
 A3=zeros(h4,natime*ntask);

 for i=1:h4
   A3(i,(H1(i)-1)*ntask+(1:Tol*ntask))=1;     
 end
  A3=[A3, zeros(h4,nextra)];
  ub3=(Tol-1)*ones(h4,1);
  
  
  % the following is priority constraints.
  B4=[];
  for i=1:ntask
     B4=blkdiag(B4, (-1)*L(i)*eye(d3(i))); 
      
  end
  
  A4=zeros(nextra, nv-nextra);
  k1=1;
  for j=1:ntask
     for k=L(j)+1:d2(j)
       A4(k1,((k-1)*ntask+j):ntask:(d2(j)-1)*ntask+j)=1;  
       k1=k1+1;
              
     end
  end
  
  A4=[A4,B4];
  ub4=zeros(nextra,1);

  
  % the following is to set obective function, which is to minimize a 
  % weighted sum: w(j)*F(j)/d2(j)
  
 if isempty(order)
    weight=ones(ntask,1);
 else
     %[~,order]=sort(order);
     %weight=ntask+1-order;
     weight=order;
    
 end
 



f1=[];
for j=1:ntask
    
    f1=[f1;weight(j)/d2(j)*ones(d3(j),1)];
end

f=[zeros(nv-nextra,1);f1];

  
  
[x,~,exitflag] = bintprog(f,[A1;-A2;A3;A4],[ub1;-L;ub3;ub4]);

if exitflag~=1
    S=0;
    return
end

x=x(1:ntask*natime);
x1=reshape(x,ntask,natime);

ind1=find(sum(x1));  

% ind1 records in which available unit the schedule assigns to a task. ind1
% ranges from 1 to natime.


for i=1: length(ind1)
      m1(intime(ind1(i)))=find(x1(:,ind1(i)))+1;
    
end

S=reshape(m1,a,b);
S(S==1)=0;
for j=1:ntask
    S(S==j+1)=j;
   
end






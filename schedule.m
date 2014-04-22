

% We assume each day the usable time is from 6am to 11pm. For notation convenience, 
% we set 1 hour as a unit and number the total usable units each day
% as 1, 2,\cdots, 18. We refer to time slot (i,j) as the ith unit on the
% jth day, where 1<=i<=18 and 1<=j<=7.

% Let a=18.
% Inputs are: 
% (1) a binary matrix M with dimension of 18 by 7, which 
% indicates the time unit (i,j) is available iff M(i,j)=1;
% (2) the number of tasks, denoted
% by n and a vector of n by 1, denoted by L, where L(j) is the number of
% time units needed to complete task j. 


% (3) We modify the input slightly. D is vector of n by 1, where D(i)
% stores the index of the deadline of the ith task. Note that the value
% D(i) ranges from 1 to a*7 and we allow two different tasks share a same
% deadline.
% 
% (4) Tol is tolenrance set by the user, which denotes the maximum number
% of time units the user would like to work continuously each day. By
% default, Tol=3. 
%
% (5) Order refers to the priority list of tasks in which the user expects 
% to finise before deadline. For example, Order=(3,1,5,4,2), which means
% the user hopes, under the precondition that all tasks are completed 
% before deadline, task 3 can be finished as early as possible.  









function S=schedule(M, D, L, Tol)
%load data1

% [~,Order]=sort(Order);


Tol=Tol+1;
a=size(M,1);
m1=reshape(M, a*7,1);
intime=find(m1);
natime=sum(m1); 

h1=sum(M);
H1=[];

for j=1:7
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

nv=natime*ntask;
% a is the parameter which denotes the number of usable time units 
% consider during each day. By default we have a=18.
% natime is the total number of available time units in the input M.
% nv=natime*ntask is the total number of binary variables introduced.

 
 d1=D;
 
 d2=zeros(ntask,1); 
 % d2(i) stores how many available time units in M before the deadline i
 
 for i=1:ntask
     d2(i)=sum(m1(1:d1(i)-1));
     
 end
 
 
 
 f=zeros(nv,1);

 A1=[];
 a1=ones(1,ntask);
 for i=1:natime
    A1=blkdiag(a1,A1); 
 end
 
 
  ub1=ones(natime,1);
  
  A2=zeros(ntask,nv);
  
  for j=1:ntask
     for i=1:d2(j)
      A2(j,j+(i-1)*ntask)=1;   
         
     end
  end
   
 h4=length(H1);
 A3=zeros(h4,nv);

 for i=1:h4
   A3(i,(H1(i)-1)*ntask+(1:Tol*ntask))=1;     
 end
 
  ub3=(Tol-1)*ones(h4,1);
 
 
    
  
[x,~,exitflag] = bintprog(f,[A1;-A2;A3],[ub1;-L;ub3]);

if exitflag~=1
    S=0;
    return
end

x1=reshape(x,ntask,natime);

ind1=find(sum(x1));  

% ind1 records in which available unit the schedule assigns to a task. ind1
% ranges from 1 to natime.


for i=1: length(ind1)
      m1(intime(ind1(i)))=find(x1(:,ind1(i)))+1;
    
end

S=reshape(m1,a,7);
S(S==1)=0;
for j=1:ntask
    S(S==j+1)=j;
   
end






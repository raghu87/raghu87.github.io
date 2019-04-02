#include<iostream>
#include<vector>
#include<algorithm>
//#include <bits/stdc++.h> 
using namespace std;

int main(){
  //vector<int> vec{3,6,9,1,0,4};

  //sort(vec.begin(),vec.end());

  //for(auto it=vec.begin();it!=vec.end();it++){
  //  cout<<*it<<endl;
  //}
  //  cout<<vec[vec.size()-2]<<endl;
  vector<int> vec;
  int n,p,d;
  cout<<"Enter the decimal digit"<<endl;
  cin>>n;
  p = n;  

  while(n!=0){
    d=n%2;
    vec.push_back(d);
    n=n/2;
  }

  //for(auto it=vec.begin();it!=vec.end();it++){
  //  cout << *it << " ";
  //}
  //cout<<endl;
  //cout << vec.size() << endl;
  //int j = -1;
  //cout << j << endl;
  //for(int i = vec.size() - 1;i >= 0;i--) {
  //  cout << i << endl;
  //  cout << vec[i] << " ";
  //}
  //cout << endl;
  for(auto it=vec.end()-1;it!=vec.begin();it--){
    cout << *it << " ";
  }
  cout<<endl;
  int count=0;
  for(auto it=vec.begin();it!=vec.end();it++){
    if(*it!=0)
      count++;
  }
  cout<<"total number of 1 presnt in "<<p<<" is : "<<count<<endl;


}

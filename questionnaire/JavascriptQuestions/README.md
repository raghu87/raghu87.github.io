1) what is the difference between 
window.onload and document.ready

2) which one loads first window.onload or document.ready

3) what is dom in javascript?

4) what is difference b/w dom and pages in javascript

5) who loads first dom or pages in javascript

6) what is isNaN?

7) how to check number is integer or not without using any inbuilt function

8) what is strict mode in javascript?

9) how to add value to array
  like var name = [];

10) what is place to added element to array after push(1,2)

11) how to add paricular element in array to top of the array? (using unshift)

12) what is difference b/w call and apply method in javascript?

13) what is the parameters needed at call and apply method? is it infinity parameter space or limited? how to add it ?
  ans: (u can add it using array element)

14) what is anonymus function in javascript?

15) what is closer function in javascript? what is the scope of variable inside that closer function? how can u access variable outside closer function?

16) what is difference between javascript and jscript?
ans: JScript is a script language from Microsoft that is expressly designed for use within Web pages. It adheres to the ECMAScript standard and is basically Microsoft's equivalent to Netscape's earlier and more widely used JavaScript.

> Math.max()

-Infinity

> Math.min()

Infinity

> [1,2,3] === [1,2,3]

false

> [1,2,3] == [1,2,3]

false

> typeof(NaN)

"number"

> var foo1 = 2/'bar'; console.log(foo1);

NaN

> 0/0

NaN

> Math.sqrt(-9)

NaN

> NaN === NaN

false

> NaN !== NaN

true

> Javascript is lexicographical sorting ie: dictionary or telephone book not numerical order
Eg: 
1) myArray = [33,2,98,25,4]; myArray.sort();

[2, 25, 33, 4, 98]

2) colors = ['red','blue']; colors.sort();

["blue", "red"]

3) numbers = [80,9]; numbers.sort()

[80, 9]

> The codePointAt() method returns a non-negative integer that is the Unicode code point value.

Eg: 

'ABC'.codePointAt(1);          // 66

'\uD800\uDC00'.codePointAt(0); // 65536

'XYZ'.codePointAt(42); // undefined

> Spidermonkey of firefox uses sort algorithm such as merge sort, insertion sort

  where as vschrome uses quick sort and insertion sort

> (Numerical sort) myArray = [33,2,98,25,4]; myArray.sort((a,b)=>a-b);

[2, 4, 25, 33, 98]

> ~ Means bitwise not operator

eg: console.log(~-2) // 1

    console.log(~-1) // 0

    console.log(~-0) // -1

> to truncate the number

~~1.234234

1

~~234324.234234

234324

Math.trunc(1.23423)

1

Math.floor(1.23423)

1

> for(;;) {} = for(;true;) = while(true) {} // infinite loop

> ![] //false

> !![] //true

> []["filter"]['constructor']( "alert('1')" )() 

gives alert

> 
 

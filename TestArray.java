
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;


public class TestArray {
	
	public static void main (String[] args) {
        
        int [] arr = new int[5];
        char [] arst = new char[4];
        
        
        arr[0] = 1;
        arr[1] = 2;
        arr[2] = 3;
        arr[3] = 4;
        arr[4] = 5;
        
        arst[0] = 'a';
        arst[1] = 'b';
        arst[2] = 'c';
        arst[3] = 'd';
        
        
        
        for(int i=0;i<arr.length;i++){
            
        System.out.println(arr[i]);
        }
        System.out.println();
        
        for(int i=0;i<arst.length;i++){
            
        System.out.print(arst[i]);
        }
        System.out.println();
		
	}
    
     // Implementing Fisher–Yates shuffle
  static void shuffleArray(int[] ar)
  {
    // If running on Java 6 or older, use `new Random()` on RHS here
    Random rnd = ThreadLocalRandom.current();
    for (int i = ar.length - 1; i > 0; i--)
    {
      int index = rnd.nextInt(i + 1);
      // Simple swap
      int a = ar[index];
      ar[index] = ar[i];
      ar[i] = a;
    }
  }
}


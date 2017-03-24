import java.io.*;
import java.util.Scanner;
import java.util.*;

public class groupies {

   public static void main(String args[]) throws IOException {  
      FileInputStream in = null;
      FileOutputStream out = null;
      
      Scanner insc = new Scanner(System.in);
   
     int[] studs = new int[40];
    System.out.print("Number of student: ");
    int Nstuds = insc.nextInt();
    
    System.out.print("Max per group: ");
    int max = insc.nextInt();
      
      
      try {
          
         in  = new FileInputStream("prog2list.txt");
         out = new FileOutputStream("mixlist.txt");
       
         
         
   

         
         
         int c,i=0;
         while ((c = in.read()) != -1 && i < Nstuds) {
             
             studs[i] = c;
             i++;
            //out.write(c);
         }
         int [] studs = {1,2,3,4,5,6,7};
         
        shuffleArray(studs);
        for (i = 0; i < studs.length; i++)
        {
            System.out.print(studs[i] + " ");
        }
        System.out.println();
  
         
      }finally {
         if (in != null) {
            in.close();
         }
         if (out != null) {
            out.close();
         }
      }
   }
}



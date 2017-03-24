import java.util.Scanner;
 
public class Exercise5 {
 
 public static void main(String[] args) {
  Scanner in = new Scanner(System.in);
   
  System.out.print("Input first number: ");
  float num1 = in.nextFloat();
   
  System.out.print("Input second number: ");
  float num2 = in.nextFloat();
   
  System.out.println(num1 + " x " + num2 + " = " + num1 * num2);
 }
 
}

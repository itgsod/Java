import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Keyboard{
    
    public static char readChar(){
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        int ascii=0;
        
        try{
            ascii = br.read();
        }catch (IOException e){
            System.err.println("Caught IOException: " + e.getMessage());
        }
     
        return (char)ascii;  //Cast an integer to character
    }
}

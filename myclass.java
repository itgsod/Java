import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class myclass 
{
    public static void main(String[] args) 
    {

        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        System.out.println("Press Enter to continue");
        try 
        {
            int ascii = br.read();
            System.out.println("ASCII Value - "+ascii);
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
    } 
}

import java.util.*;

public class Menu{
    public static void main(String[] args){
        System.out.println("Menu:");
        System.out.println("1. Mata in uppgifter");
        System.out.println("2. Spara");
        System.out.println("3. Sort");
        System.out.println("4. Quit");
        
        
        boolean cont = true;
        
        while(cont){
            char val = Keyboard.readChar();
            
        switch(val){
            case '1':
                System.out.println("You choose option 1");
        
                break;
            case '2':
                System.out.println("You choose option 2");
              
                break;
            case '3':
                System.out.println("You choose option 3");
             
                break;
            case '4':
                System.out.println("You choose to quit, Bye!");
                cont=false;
                System.exit(1);
    
            default:
                System.out.println("Choose one of the alternatives 1,2,3 or 4");
                break;
            }
            
        }
        
        
        
    }
    
    
    
}

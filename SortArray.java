import java.util.Arrays;
import java.lang.Object;
import java.util.Random;

public class SortArray{
    public static void main(String[] args) {
    int [] arr = {2,4,1,5,6,8,5,2,0,2};
    boolean [] arbol1 = {true, true, false, true};
    boolean [] arbol2 = {true, true, false, false};
    float [] randfloat;
    
    for (int i=0;i<10;i++) {
        System.out.print(arr[i] + " ");
    }
    System.out.print("\n");
    Arrays.sort(arr);
    
    for (int i=0;i<10;i++) {
        System.out.print(arr[i] + " ");
    }
    System.out.print("\n");
    
    boolean compare = Arrays.equals(arbol1,arbol2);
    if(compare == true){
        
        System.out.println("The arrays are equals");
    }else{
        System.out.println("The arrays are different");
    }
    
    

    }
    
}

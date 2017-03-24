public class Density{
    void public Density(double m, double v){
        mass = m;
        volume = v;
    }
    
    double public density(){
        
        return mass/volume;
    }
    
}

public static void main(){
    Density gas1, gas2;
    gas1 = new Density(10.0,20.0);
    gas2 = new Density(5.0,30.0);
    
    System.out.println(gas1.density());
    System.out.println(gas2.density());
    
}

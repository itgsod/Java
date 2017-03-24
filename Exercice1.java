public class Exercise1{
    
    protected class Vehicle{
        private int power;
        public char color;
        public float speed = 0.0;
        
        
        Vehicle(int p, char c, float s){
            power = p;
            color = c;
            speed = s;
            
        }
        
    }
    
    public class Bicycle extends Vehicle{
        
        super(10,"red",10.0);
        
        
    }
    
    public static void main(String[] args){
        
        Bicycle bic1 = new Bicycle();
        
        Sytem.out.println(bic1.color);
        
        
        
    }

    
}

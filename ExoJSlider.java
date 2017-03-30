import java.awt.*;
import javax.swing.*;
import javax.swing.event.*;


public class ExoJSlider extends JFrame {
    private JSlider slider1,slider2;
    private JLabel l1,l2;
    private int val1,val2;

    public ExoJSlider(){
        JPanel p1 = new JPanel();
        JPanel p2 = new JPanel();
        getContentPane().add(p1,"North");
        getContentPane().add(p2,"Center");
        l1 = new JLabel();
        l2 = new JLabel();
       
        
       //First slider
        slider1 = new JSlider(JSlider.HORIZONTAL,0,200,0);
        slider1.setMinorTickSpacing(10);
        slider1.setMajorTickSpacing(50); 
        slider1.setPaintTicks(true); 
        slider1.setPaintLabels(true);       
            
        //getContentPane().add(slider1,"North");
        //getContentPane().add(l1,"South");
        
        //Second slider
        slider2 = new JSlider(JSlider.HORIZONTAL,0,100,0);
        slider2.setMinorTickSpacing(5);
        slider2.setMajorTickSpacing(10); 
        slider2.setPaintTicks(true); 
        slider2.setPaintLabels(true);    
        
        //Third slider
        
        
           
        
        p1.setLayout(new GridLayout(2,1));
       
        p1.add(slider1);
        p1.add(slider2);
        p2.setLayout(new GridLayout(1,2));
        p2.add(l1);
        p2.add(l2);    
        
        //getContentPane().add(slider2,"Center");
        //getContentPane().add(l2,"East");
        
        Lyssnare minlys = new Lyssnare();
        
        slider1.addChangeListener(minlys);
        slider2.addChangeListener(minlys);
        
        pack();
        
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }
    
    // Lyssnare klassen
    class Lyssnare implements ChangeListener{
        public void stateChanged(ChangeEvent e){
         
            if (e.getSource() == slider1){
                val1 = slider1.getValue();
                l1.setText(Integer.toString(val1));
            }else if(e.getSource() == slider2){
                val2 = slider2.getValue();
                l2.setText(Integer.toString(val2));
                
            }
    
        }
        
    }
}


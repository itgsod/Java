import java.awt.*;
import java.awt.geom.*;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.event.*;


public class ExoJSlider extends JFrame {
    private JSlider slider1,slider2;
    private JLabel l1,l2,l3;
    private int val1=100,val2=100,val3;

    public ExoJSlider(){
        JPanel p1 = new JPanel();
        JPanel p2 = new JPanel();
        JPanel p3 = new JPanel();
        //JPanel p4 = new JPanel();
        CirkelnExo65 c1 = new CirkelnExo65(val1,val2);
        
        getContentPane().add(p3,"North");
        getContentPane().add(p2,"Center");
        getContentPane().add(p1,"South");
        //getContentPane().add(p4,"West");
        
        //l1 = new JLabel();
        //l2 = new JLabel();
        //l3 = new JLabel();
       
        
       //First slider
        slider1 = new JSlider(JSlider.HORIZONTAL,0,200,0);
        slider1.setMinorTickSpacing(10);
        slider1.setMajorTickSpacing(50); 
        slider1.setPaintTicks(true); 
        slider1.setPaintLabels(true);       
            
        //Second slider
        slider2 = new JSlider(JSlider.HORIZONTAL,0,100,0);
        slider2.setMinorTickSpacing(5);
        slider2.setMajorTickSpacing(10); 
        slider2.setPaintTicks(true); 
        slider2.setPaintLabels(true);    
        
        //Third slider
        //slider3 = new JSlider(JSlider.HORIZONTAL,-10,10,0);
        //slider3.setMinorTickSpacing(1);
        //slider3.setMajorTickSpacing(5); 
        //slider3.setPaintTicks(true); 
        //slider3.setPaintLabels(true);    
  
        
        p1.setLayout(new GridLayout(2,1));
        
        p1.add(slider1);
        p1.add(slider2);
        p2.setLayout(new GridLayout(1,1));
        p2.add(c1);
        
        //p1.add(slider3);
        //p4.setLayout(new GridLayout(2,1));
        //p4.add(l1);
        //p4.add(l2);
        //p4.add(l3);    
        
        Lyssnare minlys = new Lyssnare();
        
        slider1.addChangeListener(minlys);
        slider2.addChangeListener(minlys);
        //slider3.addChangeListener(minlys);
        
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

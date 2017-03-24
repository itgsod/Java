import java.awt.*;
import javax.swing.*;
import javax.swing.event.*;


public class ExoJSlider extends JFrame {
    private JSlider slider;
    
    public ExoJSlider() {
        JPanel p1 = new JPanel();
        getContentPane().add(p1,"Center");
        
        slider = new JSlider(JSlider.HORIZONTAL,0,255,0);
        slider.setMinorTickSpacing(10);
        slider.setMajorTickSpacing(50); 
        slider.setPaintTicks(true);
        //slider.setLabels(true);
        p1.add(slider);
        
        pack();
        
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }
    
}

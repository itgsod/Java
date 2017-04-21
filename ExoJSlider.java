import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.event.*;
//import java.awt.geom.Ellipse2D;

@SuppressWarnings("serial")

class DrawPanel extends JPanel {

    private void doDrawing(Graphics g) {

        Graphics2D g2d = (Graphics2D)g;

        g2d.setColor(Color.blue);

        g2d.setColor(Color.GREEN);
        
        //Ellipse2D circle = getCircleByCenter(100,100,100,100);
        //Shape c1 = Ellipse2D.Float(100.0f,100.0f,100.0f,100.0f);
    }

    public void paintComponent(Graphics g) {

        super.paintComponent(g);
        doDrawing(g);
    }
}

public class ExoJSlider extends JFrame {
    private JSlider slider1,slider2,slider3;
    private JLabel l1,l2,l3;
    private float val1=100.0f,val2=100.0f,val3;
    private CirkelnMov c1;
    
    public ExoJSlider(){
        JPanel p1 = new JPanel();
        //JPanel p2 = new JPanel();
        JPanel p3 = new JPanel();
        JPanel p4 = new JPanel();
        
        //c1 = new CirkelnMov((float)val1,(float)val2);
        
        getContentPane().add(p3,"North");
        getContentPane().add(p1,"South");
        getContentPane().add(p4,"Center");
        
        l1 = new JLabel();
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
        
        p3.setLayout(new GridLayout(1,1));
        p3.add(l1);
        p4.setLayout(new GridLayout(1,1));
        //p4.add(c1);
        
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
       
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
    
    // Lyssnare klassen
    class Lyssnare implements ChangeListener{
        public void stateChanged(ChangeEvent e){
         
            if (e.getSource() == slider1){
                val1 = (float)slider1.getValue();
                l1.setText(Float.toString(val1));
            }else if(e.getSource() == slider2){
                val2 = (float)slider2.getValue();
                //l2.setText(Float.toString(val2));

            }
        
        }
    }
    
    
    
    
    public void paint() {
        Graphics2D g = graphicsContext.createGraphics();
        //Point2D largeCircleCenter = new Point2D.Double((double)100.0, (double)100.0);
        //double largeCircleRadius = (double)100.0;
        //Ellipse2D c1 = getCircleByCenter(largeCircleCenter, largeCircleRadius);

        g.setColor(Color.GREEN);
  
        g.fill(c1);
        g.draw(c1);
        
        g.dispose();
        
        //contextRender.repaint();
        

    }

}

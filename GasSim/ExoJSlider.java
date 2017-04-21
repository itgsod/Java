import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.event.*;
import java.util.Random;


@SuppressWarnings("serial")
public class ExoJSlider extends JFrame {
    private JSlider slider1,slider2,slider3;
    private JPanel p1,p2,p3,p4;
    private DrawPanel dpnl;
    private JLabel l1,l2,l3;
    private int val1=2000,val2=100;
    private Molecule mols[];
    
    
    
   // private CirkelnMov c1;
    
    public ExoJSlider(){
        p1 = new JPanel();
        //p2 = new JPanel();
        //p3 = new JPanel();
        p4 = new JPanel();
        
        //c1 = new CirkelnMov((float)val1,(float)val2);
        
        //getContentPane().add(p3,"North");
        getContentPane().add(p1,"South");
        getContentPane().add(p4,"Center");
        
        //l1 = new JLabel();
        //l2 = new JLabel();
        //l3 = new JLabel();
       
       //First slider
        slider1 = new JSlider(JSlider.HORIZONTAL,0,10000,2000);
        slider1.setMinorTickSpacing(2000);
        slider1.setMajorTickSpacing(1000); 
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
        
        //p3.setLayout(new GridLayout(1,1));
        //p3.add(l1);
        p4.setLayout(new GridLayout(1,1));
        
        dpnl = new DrawPanel();
        p4.add(dpnl);

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
                val1 = slider1.getValue();
                //mols = new Molecule[maxMolCount];
                repaint();
                //l1.setText(Float.toString(val1));
            }else if(e.getSource() == slider2){
                val2 = slider2.getValue();
                //l2.setText(Float.toString(val2));

            }
        
        }
    }
    class Molecule {
        public float x, y, dx, dy, mass;
        public int r, type; 
        public Color color;
        public Molecule next, prev;
        public boolean listHead;
        Molecule() {
            r = 2;
            type = 0;
            mass = 2;
            next = prev = this;
        }
    };

    class DrawPanel extends JPanel {

    public void doDrawing(Graphics g) {

        Graphics2D g2d = (Graphics2D) g;

        g2d.setColor(Color.blue);

        for (int i = 0; i <= val1; i++) {

            Dimension size = getSize();
            Insets insets = getInsets();

            int w = size.width - insets.left - insets.right;
            int h = size.height - insets.top - insets.bottom;

            Random r = new Random();
            int x = Math.abs(r.nextInt()) % w;
            int y = Math.abs(r.nextInt()) % h;
            //g2d.drawLine(x, y, x, y);
            //g2d.Ellipse2D.Float((float)x,(float)y,5.0,5.0);
            //Molecule m = new Molecule();
            //m.x = (float)x;
            //m.y = (float)y;
            //mols[i] = m;
            
            Shape circle = new Ellipse2D.Float((float)x, (float)y, (float)2.0, (float)2.0); 
    
            g2d.draw(circle);
            g2d.setPaint(Color.blue);
            g2d.fill(circle);

        }
    }

    public void paintComponent(Graphics g) {

        super.paintComponent(g);
        doDrawing(g);
    }
}
  
}

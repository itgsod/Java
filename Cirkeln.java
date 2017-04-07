import java.awt.*;
import java.awt.event.*;
import java.awt.geom.*;
import javax.swing.*;
import javax.swing.event.*;


public class Cirkeln extends JFrame {
    Shape circle = new Ellipse2D.Float(100.0f, 100.0f, 100.0f, 100.0f);
    Shape square = new Rectangle2D.Double(100, 100, 100, 100);

@SuppressWarnings("serial")

public class Cirkeln extends JFrame {
	
    Shape circle = new Ellipse2D.Float(100.0f, 100.0f, 100.0f, 100.0f); 
    
    public void paint(Graphics g) {
        Graphics2D ga = (Graphics2D)g;
        ga.draw(circle);
        ga.setPaint(Color.green);
        ga.fill(circle);

    };

    public static void main(String args[]) {
        Cirkeln c1 = new Cirkeln();
        
        c1.setSize(300, 300);
        c1.setVisible(true);
        //setDefaultCloseOperation(EXIT_ON_CLOSE);
    }
 
}
    public static void main(String args[]) {
        Cirkeln c1 = new Cirkeln();
  
        c1.setSize(600, 600);
        c1.setVisible(true);
         
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }
}

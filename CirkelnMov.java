import java.awt.*;
import java.awt.event.*;
import java.awt.geom.*;
import javax.swing.*;
import javax.swing.event.*;

@SuppressWarnings("serial")
public class CirkelnMov extends JFrame {
    
    Shape circle;
    
    public CirkelnMov(float xarg,float yarg){

        circle = new Ellipse2D.Double(xarg, yarg, 50.0, 50.0); 
        
    }
 
    
    public void paint(Graphics g) {
        Graphics2D ga = (Graphics2D)g;
        ga.draw(circle);
        ga.setPaint(Color.green);
        ga.fill(circle);

    };

    //public static void main(String args[]) {
        //CirkelnMov c1 = new CirkelnMov(200.0,300.0);
        
        //c1.setSize(300, 300);
        //c1.setVisible(true);
    
    //}
 
}



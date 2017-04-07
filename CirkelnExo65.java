import java.awt.*;
import java.awt.event.*;
import java.awt.geom.Ellipse2D;
import javax.swing.*;

public class CirkelnExo65 extends Shape{
    //Shape circle;
    int x,y;
    
    public CirkelnExo65(int xarg,int yarg){
        x=xarg;
        y=yarg;
    }
    
    Shape circle = new Ellipse2D.Int(x, y, 50, 50);
    //circle =  drawOval(200,200,50,50);
    
        public void paint(Graphics2D g) {
            Graphics2D ga = (Graphics2D)g;
            ga.draw(circle);
            ga.setPaint(Color.red);
            ga.fill(circle);

         }
    }
 //public static void main(String[] args) {
     //CirkelnExo65 c = new CirkelnExo65();
     //c.setVisible(true);
     
 //}


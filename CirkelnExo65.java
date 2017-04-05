import java.awt.*;
import java.awt.event.*;
import java.awt.geom.*;


public class CirkelnExo65{
    Shape circle;
    
    public CirkelnExo65(int xarg,int yarg){
        int x,y;
        x=xarg;
        y=yarg;
        
        circle = new Ellipse2D.Float(x, y, 50, 50);
        //circle =  drawOval(200,200,50,50);
    

    };
    public void paint(Graphics2D g) {
            Graphics2D ga = (Graphics2D)g;
            ga.draw(circle);
            ga.setPaint(Color.red);
            ga.fill(circle);

    };
}

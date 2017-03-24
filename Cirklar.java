//Rita cirklar
import java.awt.*;
import javax.swing.*;


public class Cirklar extends JPanel{
    private int röd;
    private int grön;
    private int blå;
    
    public Cirklar(int r, int g, int b){
        röd = r;
        grön = g;
        blå = b;
        setBackground(Color.white);
        setPreferredSize(new Dimension(350,450));
    }
    
    public void paintComponent(Graphics gf){
        super.paintComponent(gf);
        Color r = new Color(röd,0,0);
        Color g = new Color(0,grön,0);
        Color b = new Color(0,0,blå);
       Color vit = new Color(255,255,255);
       
        gf.setColor(r);
        gf.fillOval(135,120,80,80);
        gf.setColor(g);
        gf.fillOval(225,170,80,80);
        gf.setColor(b);
        gf.fillOval(225,270,80,80);
        Color rg = new Color(röd,grön,0);
        gf.setColor(rg);
        gf.fillOval(135,320,80,80);
        Color rb = new Color(röd,0,blå);
        gf.setColor(rb);
        gf.fillOval(45,270,80,80);
        Color gb = new Color(0,grön,blå);
        gf.setColor(gb);
        gf.fillOval(45,170,80,80);
        Color rgb = new Color(röd,grön,blå);
        gf.setColor(rgb);
        gf.fillOval(135,220,80,80);
        gf.setColor(vit);
        gf.fillOval(135,220,80,80);
        
        
    }
    
    
    
}

import java.awt.*;
import java.awt.event.*;
import java.swing.*;

class Tennisbana extends JPanel implements ActionListener{
    private Timer klocka = new Timer(10,this);
    private JLabel visaPoäng;
    private int poäng;
    private int x,y,xMax,yMax; // ball coordinates
    private int radie,vx,vy,xSteg,ySteg; // ball properties
    private int xSteg,ySteg; // ball steps x-coord y-coord
    private racket, längdR, stegR;  //rackets properties
    
    public Tennisbana(){
        setPreferredSize(new Dimension(300,400));
        setBackground(color.red);
    }
    
    public void start(JLabel p){
        visaPoäng = p;
        xMax = getSize().width;
        yMax = getSize().height;
        radie = 15;
        längdR = 40;
        stegR = 15;
        nollställ();
        
        // lyssnar på tangentbordet
        addKeyListener (new KeyAdapter(){
            public void keyPressed(KeyEvent e){
                if (e.getKeyCode() == KeyEvent.VK_LEFT){
                    racket = Math.max(0,racket-stegR);
                }else if(e.getKeyCode() == KeyEvent.VK_RIGHT){
                    racket = Math.min(xMax-längdR,racket+stegR);
                }
        
            }
            
        });
        // lyssnar på storleksändringar
        addComponentListener(new ComponentAdapter(){
            
            
        });
    }
    
    
}

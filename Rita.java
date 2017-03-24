import java.awt.*;
import javax.swing.*;


public class Rita extends JFrame{
    
    public Rita(){
        
        
        JPanel p = new JPanel();
        p.setBackground(Color.white);
        Cirklar c = new Cirklar(220,220,220);
        
        getContentPane().add(p,"North");
        getContentPane().add(c,"South");
        
        JLabel rubrik = new JLabel("Cirklar med olika färger");
        p.add(rubrik);
        
        pack();
        
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        
    }
    
}
    


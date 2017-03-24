import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.io.*;

public class Tennis {
    
    public static void main(String[] args){
        JFrame frame = new JFrame("Title");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JLabel hi = new JLabel("Hello Word");
        
        frame.getContentPane().add(hi);
    
        frame.pack();
        frame.setVisible(true);
    }
}

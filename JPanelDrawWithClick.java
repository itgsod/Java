import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class JPanelDrawWithClick extends JFrame 
{

	public static int x;
	public static int y;

	public static void main(String args[]) 
	{
		new JPanelDrawWithClick();
	}

	JPanelDrawWithClick() 
	{
		setSize(500, 400);
	
		MyJPanel panel = new MyJPanel();
		
        Container container = getContentPane();
		container.add(panel);	      

		setVisible(true);
	}

	//Inner Class
	public class MyJPanel extends JPanel implements MouseListener
	{	

	  MyJPanel()
	  {
	    addMouseListener(this);
	  }
      
      public void paintComponent(Graphics graphics){
          int r = 255;
          int g = 255;
          int b = 255;
          
          int x,y;
          
          x = getValue();
          y = getValue();
          
          graphics.setColor(new Color(0w,g,0));
          graphics.fillOval(JPanelDrawWithClick.x,JPanelDrawWithClick.y,40,40);
          
          
      }
	  public void paintComponent(Graphics graphics)
	  {	      
	      int r= (int)Math.round((Math.random()*255));
	      int g= (int)Math.round((Math.random()*255));
	      int b= (int)Math.round((Math.random()*255));

	      graphics.setColor(new Color(r,g,b));
	      graphics.fillOval(JPanelDrawWithClick.x,JPanelDrawWithClick.y,40,40);
	  }

	  //Overridden Methods from MouseListener Interface
	  //These methods are called automatically when corresponding mouse
	  //event occurs 
	  /////////////////////////////////////////////////

	  public void mousePressed(MouseEvent e) 
	  {
	    x = e.getX();
	    y = e.getY();
	    repaint();
	  }
	  
	  public void mouseReleased(MouseEvent e)
	  {}
	  
	  public void mouseEntered(MouseEvent e) 
	  {}
	  
	  public void mouseExited(MouseEvent e) 
	  {}
	  
	  public void mouseClicked(MouseEvent e) 
	  {}
	}
}

import java.awt.*;
import java.awt.event.*;
import java.awt.geom.*;
import javax.swing.*;

public class Cirkeln extends Frame {
	Shape circle = new Ellipse2D.Float(100.0f, 100.0f, 100.0f, 100.0f);
	Shape square = new Rectangle2D.Double(100, 100,100, 100);

public void paint(Graphics2D g) {
		Graphics2D ga = (Graphics2D)g;
		ga.draw(circle);
		ga.setPaint(Color.green);
		ga.fill(circle);
		ga.setPaint(Color.red);
		ga.draw(square);
		}

	public static void main(String args[]) {
		Frame frame = new Cirkeln();
		frame.addWindowListener(new WindowAdapter(){
			public void windowClosing(WindowEvent we){
				System.exit(0);
			}
		});
		frame.setSize(600, 600);
		frame.setVisible(true);
	}
}

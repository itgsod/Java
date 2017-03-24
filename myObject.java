public class myObject
{
    public static void main(String[] args){
        
	static int objectCount = 0;

	public myObject()
	{
		objectCount++;
	}

	public String toString()
	{
		return new String ("There are " + objectCount + " objects");
	}
}

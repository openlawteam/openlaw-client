import org.scalatest.{FlatSpec, Matchers}

 /**
  * Created by davidroon on 09.06.17.
  */
class HexTest extends FlatSpec with Matchers {

   "Hex" should "work like in the jvm" in {
    val value = "30c6738e9a5cc946d6ae1f176dc69fa1663b3b2c"
    Hex.bytes2hex(Hex.hex2bytes(value)) shouldEqual value
  }
}

 object Hex {
  def hex2bytes(hex: String): Array[Byte] = {
    hex.sliding(2, 2).toArray.map(Integer.parseInt(_, 16).toByte)
  }

   def bytes2hex(bytes: Array[Byte], sep: Option[String] = None): String = {
    sep match {
      case None => bytes
          .map(_.toInt & 0xff)
        .map("%02x".format(_)).mkString
      case _ => bytes.map("%02x".format(_)).mkString(sep.get)
    }
  }
}

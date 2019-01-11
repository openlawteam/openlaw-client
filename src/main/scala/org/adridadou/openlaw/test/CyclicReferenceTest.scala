import org.scalatest.{FlatSpec, Matchers}

import scala.collection.mutable
import scala.scalajs.js.annotation.{JSExport, JSExportTopLevel}

 /**
  * Created by davidroon on 09.06.17.
  */
class CyclicReferenceTest extends FlatSpec with Matchers {

   "cyclic reference" should "work properly" in {
    val root = CyclicTest.createRoot()
    val child = CyclicTest.addChild(root, "child")
    child.parent shouldBe Some(root)
    root.children shouldBe Map("child" -> child)
  }
}

 @JSExportTopLevel("CyclicTest")
object CyclicTest {

   @JSExport
  def createRoot():Element = Element(value = "root")

   @JSExport
  def addChild(element:Element, value:String):Element = element.addChild(value)
}

 case class Element(children:mutable.Map[String, Element] = mutable.Map(), parent:Option[Element] = None, value:String) {
  def addChild(value:String):Element = {
    val child = Element(value = value, parent = Some(this))
    children.put(value, child)
    child
  }
}

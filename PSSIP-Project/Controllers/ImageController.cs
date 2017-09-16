using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using System.Xml;
using PSSIP_Project.Models;
using Newtonsoft.Json;


namespace PSSIP_Project.Controllers
{
    public class ImageController: Controller
    {
        private readonly Random _random = new Random(DateTime.Now.Millisecond);
        private static int MaxStar = 6;


        public ActionResult AddImage(HttpPostedFileBase file) /*copying new image into image folder*/
        {
            var fileName = file.FileName; /*selected file name*/
            var path = GetPathToImg(fileName);
            file.SaveAs(path);  /*saving in new folder*/
            return RedirectToAction("Index","Home"); /*returning to home page*/
        }

        public ActionResult RemoveImage(string url) /*deleting file in image folder*/
        {
            var path = Server.MapPath(url);
            System.IO.File.Delete(path); /*C# system deleting function*/            
            return Json(true);
        }

        public JsonResult AddImgAjax(string fileName, string data, int star)
        {
            var firsIndex = data.IndexOf('/')+1;
            var secondIndex = data.IndexOf(';')-firsIndex;
            var imageExtension = data.Substring(firsIndex,secondIndex) ;
            
            
            var dataIndex = data.IndexOf("base64", StringComparison.Ordinal) + 7;
            var clearData = data.Substring(dataIndex);
            var fileData = Convert.FromBase64String(clearData);
            var bytes = fileData.ToArray();

            fileName = fileName + '.' + imageExtension;

            var path = GetPathToImg(fileName);

            using (var fileStream = System.IO.File.Create(path))
            {
                fileStream.Write(bytes,0,bytes.Length);
                fileStream.Close();
            }
            SaveImageRating(star, path);

            return Json(true, JsonRequestBehavior.AllowGet);
        }

        public void SaveImageRating (int star, string path)
        {
            FileInfo fl = new FileInfo(Path.Combine(Server.MapPath("~"), "App_Data", "DataStorage.json"));
            StreamWriter sw = fl.AppendText();
            string[,] myArray = new string[1,2];
            myArray[0,0] = Path.GetFileNameWithoutExtension(path);
            myArray[0,1] = Convert.ToString(star);
            sw.WriteLine(JsonConvert.SerializeObject(myArray));
            sw.Close();
        }

        public JsonResult GetImage() /*getting image array*/
        {
            var serverPath = Server.MapPath("~");
            var pathToImageFolder = Path.Combine(serverPath, "image");
            var imageFile = Directory.GetFiles(pathToImageFolder); /*reading all files in folder*/
            var images = imageFile.Select(BuildImage); /**getting image set*/
            return Json(images, JsonRequestBehavior.AllowGet);
        }

        private string GetPathToImg(string fileName) /*just the image path*/
        {
            return Path.Combine(Server.MapPath("~"), "image", fileName);
        }

        private Image BuildImage(string path) /*creating objects of image model*/
        {
            var fileName = Path.GetFileName(path); /*getting file name*/

            int star = _random.Next(1, MaxStar);
            string[,] myArray = new string[1, 2];
            string[] readText = new string[10];

            StreamReader fs = new StreamReader(@""+ Path.Combine(Server.MapPath("~"), "App_Data", "DataStorage.json") + "");
            for (int x = 0; x<10; x++)
            {
                try
                {
                    readText[x] = fs.ReadLine();
                    myArray = JsonConvert.DeserializeObject<string[,]>(readText[x]);
                    if (myArray[0, 0] == Path.GetFileNameWithoutExtension(path)) star = Convert.ToInt32(myArray[0, 1]);
                }
                catch { }
            }
            fs.Close();

            var image = new Image
            {
                Url = Url.Content("~/image/" + fileName),  /*constructing image model*/
                Name = Path.GetFileNameWithoutExtension(path),
                Description = Path.GetExtension(path),
                Star = star
            };
            return image;
        }

    }
}
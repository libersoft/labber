<?php

$response = array();
$destinationDir = __DIR__.'/uploads/'.$_REQUEST['subdirectory'].'/';

try
{
  if (isset($_FILES['attachment']))
  {
    $fileName = $_FILES['attachment']['name'];
    $tmpName  = $_FILES['attachment']['tmp_name'];

    if (is_uploaded_file($tmpName)) {
      $success = move_uploaded_file($tmpName, $destinationDir . $fileName);
    } else {
      throw new Exception('Possible file upload attack!');
    }

    $response['success'] = $success;
    $response['msg'] = 'Processed file "' . $fileName . '" on the server';
    $response['filename'] = $fileName;
  }
  else
  {
    throw new Exception('Please sir, no touching of the controller...');
  }
}
catch (Exception $e)
{
  $response['success'] = false;
  $response['msg'] = $e->getMessage();
}

echo json_encode($response);

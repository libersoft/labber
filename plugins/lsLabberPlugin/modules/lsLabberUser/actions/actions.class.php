<?php

/**
 * user actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberUser
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action user
 */
class lsLabberUserActions extends sfActions
{
 /**
  * Gestisce la create e la update di sfGuardUser con Profile associato
  *
  * @extdirect-enable
  * @extdirect-len 1
  */
  public function executeSave(sfWebRequest $request)
  {
    try
    {
      $raw = $request->getParameter('_raw');
      $data = $raw[0];

      // se è vuoto, è una new
      if ($data->id)
      {
        $user = Doctrine::getTable('sfGuardUser')->find($data->id);
      }
      else
      {
        $user = new sfGuardUser();
      }

      foreach ($data as $k => $v)
      {
        switch ($k)
        {
          case 'username':
            $user->set($k, $v);
            break;
          case 'password':
            $user->setPassword($v);
            break;
          case (substr($k, 0, 7) == 'Profile'):
            if ($v === '')
            {
              $v = null;
            }
            $user->Profile[substr($k, 8)] = $v;
            break;
          case 'permissions':
            if ($user->getPermissions()->getPrimaryKeys() !== $v)
            {
              $user->unlink('permissions');
              $user->link('permissions', $v);
            }
            break;
          default:
            break;
        }
      }

      $user->save();

      $this->result = array(
        'success' => true
      );
    }
    catch (Exception $exc)
    {
      $this->result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }

    return sfView::SUCCESS;
  }

 /**
  * Cambia la password di un utente
  *
  * @extdirect-enable
  * @extdirect-len 1
  */
  public function executeChangePassword(sfWebRequest $request)
  {
    try
    {
      $values = $request->getParameter('values');

      $user = Doctrine::getTable('sfGuardUser')->find($values->id);
      if ($user->checkPassword($values->actual))
      {
        $user->setPassword($values->new);
        $user->save();
      }
      else
      {
        throw new Exception('Password sbagliata!');
      }

      $result = array(
        'success' => true,
        'message' => 'Password modificata'
      );
    }
    catch (Exception $e)
    {
      $result = array(
        'success' => false,
        'message' => $e->getMessage()
      );
    }

    $this->result = $result;
    return sfView::SUCCESS;
  }
}

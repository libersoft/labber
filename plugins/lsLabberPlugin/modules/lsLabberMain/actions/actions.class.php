<?php

/**
 * main actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberMain
 * @author     LiberSoft <info@libersoft.it>
 */
class lsLabberMainActions extends sfActions
{
  /**
   * L'index include tutti i JS dell'applicazione, *DOPO* il login (sfGuardAuth)
   *
   * @return labber_config Lista di configurazioni che finiscono in Lab.CONFIG
   */
  public function executeIndex(sfWebRequest $request)
  {

    $config_apc = "";

    $user = $this->getUser();
    // Implementa l'autologin se l'env è di sviluppo
    if (sfConfig::get('sf_environment') == 'dev' && !$user->isAuthenticated())
    {
      $q = Doctrine_Query::create()
        ->from('sfGuardUser')
        ->where('username = ?', sfConfig::get('app_dev_default_user'));
      $user->signIn($q->fetchOne());
    }

    // Si istanzia Lab.CONFIG con alcuni parametri globali
    if ($user->isAuthenticated())
    {
      // Controlloph se APC è disponibile
      if (function_exists('apc_store') && ini_get('apc.enabled'))
      {
        // Controllo se i parametri globali sono in APC
        if ((!$config_apc = apc_fetch(sfConfig::get('app_install_id') . '_configurations')) ||
          // o se richiedono di essere rinfrescati
          apc_fetch(sfConfig::get('app_install_id') . '_configurations_dirty_flag'))
        {
          $config_db = array();
          $configurations_table = Doctrine::getTable('Configurations')->findAll()->toArray();

          foreach ($configurations_table as $conf)
          {
            $config_db[$conf['name']] = json_decode($conf['value']);
          }

          $config_apc = json_encode($config_db);
          apc_store(sfConfig::get('app_install_id') . '_configurations', $config_apc);
          apc_store(sfConfig::get('app_install_id') . '_configurations_dirty_flag', false);
        }
      }

      // Parametri globali non salvati in APC perchè user-dipendenti
      $department = $user->getProfile()->getDepartment();
      $config_user = array(
          'logout_url' => $this->getController()->genUrl('@sf_guard_signout'),
          'root_dir' => 'http' . (isset($_SERVER["HTTP_HTTPS"]) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']),
          'base_url' => 'http' . (isset($_SERVER["HTTP_HTTPS"]) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['SCRIPT_NAME'],
          'user' => array(
              'id' => $user->getGuardUser()->id,
              'profile_id' => $user->getProfile()->id,
              'in_sales' => $user->getProfile()->in_sales,
              'in_sales_secretary' => $user->getProfile()->is_sales_secretary,
              'userid' => $user->getUserName(),
              'fullname' => $user->getFullName(),
              'permissions' => $user->getPermissionNames(),
              'is_admin' => $user->hasCredential('admin'),
              'is_interlab' => $user->isInterdepartmental(),
              'department' => array(
                  'id' => $department->id,
                  'name' => $department->name,
              )
          ),
      );

      $config = array_merge($config_user, strlen($config_apc) ? json_decode($config_apc, true) : array());
      $this->labber_config = json_encode($config);
    }
    else
    {
      die('Non sei autenticato!');
    }
  }
}

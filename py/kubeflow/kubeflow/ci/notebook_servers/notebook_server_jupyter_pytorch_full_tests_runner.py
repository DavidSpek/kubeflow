# This file is only intended for development purposes
from kubeflow.kubeflow.ci import base_runner

base_runner.main(component_name="notebook-server-jupyter-pytorch-full",
                 workflow_name="nb-j-pt-f-tests")

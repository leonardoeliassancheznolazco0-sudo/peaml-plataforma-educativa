import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

import pandas as pd
import numpy as np
import importlib.util

spec = importlib.util.spec_from_file_location(
    "ml_model",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app", "ml", "model.py")
)
ml_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ml_module)
generate_dataset = ml_module.generate_dataset

df = generate_dataset(600)

def test_dataset_sin_nulos():
    nulos = df.isnull().sum().sum()
    pct_validos = (1 - nulos / (df.shape[0] * df.shape[1])) * 100
    print(f"\n  Registros totales: {len(df)}")
    print(f"  Valores nulos: {nulos}")
    print(f"  Registros validos: {pct_validos:.1f}%")
    assert pct_validos >= 98

def test_dataset_perfiles_cubiertos():
    perfiles = df["tipo_perfil"].unique().tolist()
    print(f"\n  Perfiles en dataset: {perfiles}")
    assert "TEA"      in perfiles
    assert "TDAH"     in perfiles
    assert "dislexia" in perfiles
    assert "general"  in perfiles

def test_dataset_niveles_cubiertos():
    niveles = df["nivel_actual"].unique().tolist()
    print(f"\n  Niveles en dataset: {niveles}")
    assert "basico"     in niveles
    assert "intermedio" in niveles
    assert "avanzado"   in niveles

def test_dataset_rangos_edad():
    min_edad = df["edad"].min()
    max_edad = df["edad"].max()
    print(f"\n  Edad minima: {min_edad} | Edad maxima: {max_edad}")
    assert min_edad >= 6
    assert max_edad <= 14

def test_dataset_distribucion_perfiles():
    dist = df["tipo_perfil"].value_counts(normalize=True) * 100
    print(f"\n  Distribucion de perfiles:")
    for perfil, pct in dist.items():
        print(f"    {perfil}: {pct:.1f}%")
    assert all(pct >= 10 for pct in dist.values)

def test_dataset_tamanio_minimo():
    print(f"\n  Total registros: {len(df)}")
    assert len(df) >= 500
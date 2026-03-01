"""
Ejemplo de uso de la función solve_simple_circuit.
Demuestra cómo resolver circuitos simples en serie.
"""

from backend.app.simulation.engine.solver import solve_simple_circuit


def ejemplo_basico():
    """Ejemplo básico: circuito con 2 resistencias."""
    print("=" * 60)
    print("EJEMPLO 1: Circuito Simple con 2 Resistencias")
    print("=" * 60)
    
    resistencias = [
        {'id': 'R1', 'resistance': 100},   # 100 Ω
        {'id': 'R2', 'resistance': 200}    # 200 Ω
    ]
    voltaje = 150  # 150 V
    
    resultado = solve_simple_circuit(voltaje, resistencias)
    
    print(f"📊 Voltaje Total: {voltaje} V")
    print(f"📊 Resistencia Total: {resultado['resistencia_total']} Ω")
    print(f"⚡ Corriente Total: {resultado['corriente_total']} A")
    print("💡 Potencias Disipadas:")
    
    for comp in resultado['potencias']:
        print(f"  - {comp['id']}:")
        print(f"    Voltaje: {comp['voltaje']} V")
        print(f"    Corriente: {comp['corriente']} A")
        print(f"    Potencia: {comp['potencia']} W")
    
    # Verificación: suma de potencias
    potencia_total = sum(comp['potencia'] for comp in resultado['potencias'])
    print(f"\n✓ Potencia Total: {round(potencia_total, 6)} W")
    print(f"✓ Verificación V*I: {round(voltaje * resultado['corriente_total'], 6)} W")


def ejemplo_tres_resistencias():
    """Ejemplo con 3 resistencias."""
    print("\n" + "=" * 60)
    print("EJEMPLO 2: Circuito con 3 Resistencias")
    print("=" * 60)
    
    resistencias = [
        {'id': 'R1', 'resistance': 50},
        {'id': 'R2', 'resistance': 100},
        {'id': 'R3', 'resistance': 150}
    ]
    voltaje = 300  # 300 V
    
    resultado = solve_simple_circuit(voltaje, resistencias)
    
    print(f"📊 Voltaje Total: {voltaje} V")
    print(f"📊 Resistencia Total: {resultado['resistencia_total']} Ω")
    print(f"⚡ Corriente Total: {resultado['corriente_total']} A")
    print("💡 Detalles por Resistencia:")
    
    for comp in resultado['potencias']:
        print(f"\n  {comp['id']}:")
        print(f"    Voltaje: {comp['voltaje']} V")
        print(f"    Corriente: {comp['corriente']} A")
        print(f"    Potencia: {comp['potencia']} W")


def ejemplo_resistencias_iguales():
    """Ejemplo con resistencias iguales."""
    print("\n" + "=" * 60)
    print("EJEMPLO 3: Circuito con Resistencias Iguales (1kΩ cada una)")
    print("=" * 60)
    
    resistencias = [
        {'id': 'R1', 'resistance': 1000},
        {'id': 'R2', 'resistance': 1000},
        {'id': 'R3', 'resistance': 1000},
        {'id': 'R4', 'resistance': 1000}
    ]
    voltaje = 120  # 120 V (voltaje doméstico)
    
    resultado = solve_simple_circuit(voltaje, resistencias)
    
    print(f"📊 Voltaje Total: {voltaje} V")
    print(f"📊 Resistencia Total: {resultado['resistencia_total']} Ω")
    print(f"⚡ Corriente Total: {resultado['corriente_total']} A")
    print(f"💡 Potencia por Resistencia: {resultado['potencias'][0]['potencia']} W")
    print(f"💡 Potencia Total: {sum(r['potencia'] for r in resultado['potencias'])} W")


if __name__ == "__main__":
    ejemplo_basico()
    ejemplo_tres_resistencias()
    ejemplo_resistencias_iguales()
    
    print("\n" + "=" * 60)
    print("✓ Ejemplos completados exitosamente")
    print("=" * 60)
